pkg load signal


function myplot(xdata, ydata, sym, ttl, xlab, ylab, grd, ...
                 lgnd, linewidth, fontsize)
% MYPLOT - Generic plot - compatibility wrapper for plot()

  if nargin<10, fontsize=12; end
  if nargin<9, linewidth=1; end
  if nargin<8, lgnd=''; end
  if nargin<7, grd=1; end
  if nargin<6, ylab=''; end
  if nargin<5, xlab=''; end
  if nargin<4, ttl=''; end
  if nargin<3, sym=''; end
  if nargin<2, ydata=xdata; xdata=0:length(ydata)-1; end

  plot(xdata,ydata,sym,'linewidth',linewidth); 
  if length(ttl)>0, title(ttl,'fontsize',fontsize,...
                              'fontname','helvetica'); 
  end
  if length(ylab)>0, ylabel(ylab,'fontsize',fontsize,...
                                 'fontname','helvetica'); 
  end
  if length(xlab)>0, xlabel(xlab,'fontsize',fontsize,...
                                 'fontname','helvetica'); 
  end
  if grd, grid('on'); else grid('off'); end
  if length(lgnd)>0, legend(lgnd); end
end

function [B,A] = psos2tf(sos,g)

    if nargin<2, g=1; end

    [nsecs,tmp] = size(sos);
    if nsecs<1, B=[]; A=[]; return; end
    Bs = sos(:,1:3);
    As = sos(:,4:6);
    B = Bs(1,:);
    A = As(1,:);
    for i=2:nsecs
      B = conv(B,As(i,:)) + conv(A,Bs(i,:));
      A = conv(A,As(i,:));
    end

end


F =  [700, 2100, 3000, 4200, 4700]; BW = [60, 90, 100, 120, 120]; fs = 48000; R = exp(-pi*BW/fs); theta = 2*pi*F/fs; poles = R .* exp(j*theta); B = 1; A = real(poly([poles,conj(poles)]));

% freqz(B,A); % View frequency response:

disp("  B =")
disp(B)
disp("  A = ")
disp(A)

disp("  filter(B, A, [-2 0 1]) = ")
disp(filter(B, A, [-2 0 1]))

% Convert to parallel complex one-poles (PFE):
[r,p,f] = residuez(B,A);

As = zeros(nsecs,3);
Bs = zeros(nsecs,3);
% complex-conjugate pairs are adjacent in r and p:
for i=1:2:2*nsecs
    k = 1+(i-1)/2;
    Bs(k,:) = [r(i)+r(i+1),  -(r(i)*p(i+1)+r(i+1)*p(i)), 0];
    As(k,:) = [1, -(p(i)+p(i+1)), p(i)*p(i+1)];
end

sos = [Bs,As]; % standard second-order-section form
iperr = norm(imag(sos))/norm(sos); % make sure sos is ~real
disp(sprintf('||imag(sos)||/||sos|| = %g',iperr)); % 1.6e-16
sos = real(sos) % and make it exactly real

% Reconstruct original numerator and denominator as a check:
[Bh,Ah] = psos2tf(sos); % parallel sos to transfer function
% psos2tf appears in the matlab-utilities appendix
disp(sprintf('||A-Ah|| = %g',norm(A-Ah))); % 5.77423e-15
% Bh has trailing epsilons, so we'll zero-pad B:
disp(sprintf('||B-Bh|| = %g',...
             norm([B,zeros(1,length(Bh)-length(B))] - Bh)));
% 1.25116e-15

% Plot overlay and sum of all three
% resonator amplitude responses:
nfft=512;
H = zeros(nsecs+1,nfft);
for i=1:nsecs
  [Hiw,w] = freqz(Bs(i,:),As(i,:));
  H(1+i,:) = Hiw(:).';
end
H(1,:) = sum(H(2:nsecs+1,:));
ttl = 'Amplitude Response';
xlab = 'Frequency (Hz)';
ylab = 'Magnitude (dB)';
sym = '';
lgnd = {'sum','sec 1','sec 2', 'sec 3'};
np=nfft/2; % Only plot for positive frequencies
wp = w(1:np); Hp=H(:,1:np);
figure(1); clf;
myplot(wp,20*log10(abs(Hp)),sym,ttl,xlab,ylab,1,lgnd);
disp('PAUSING'); pause;
saveplot('../eps/lpcexovl.eps');

% Now synthesize the vowel [a]:
nsamps = 256;
f0 = 200; % Pitch in Hz
w0T = 2*pi*f0/fs; % radians per sample

nharm = floor((fs/2)/f0); % number of harmonics
sig = zeros(1,nsamps);
n = 0:(nsamps-1);
% Synthesize bandlimited impulse train
for i=1:nharm,
    sig = sig + cos(i*w0T*n);
end;
sig = sig/max(sig);
speech = filter(1,A,sig);
soundsc([sig,speech]); % hear buzz, then 'ah'

